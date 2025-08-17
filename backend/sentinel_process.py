import os
import io
from typing import Tuple, Optional, List

import numpy as np
from PIL import Image

from sentinelhub import (
    SHConfig,
    DataCollection,
    SentinelHubRequest,
    BBox,
    bbox_to_dimensions,
    CRS,
    MimeType,
)


# NDVI -> color mapping evalscript (returns RGBA)
EVALSCRIPT_NDVI = """
//VERSION=3
function setup() {
    return {
        input: [{
            bands: ["B04", "B08", "dataMask"]
        }],
        output: {
            bands: 4,
            sampleType: "UINT8"
        }
    };
}

function evaluatePixel(sample) {
    let val = (sample.B08 - sample.B04) / (sample.B08 + sample.B04);
    let imgVals = null;

    if (val<-1.1) imgVals = [0,0,0];
    else if (val<-0.2) imgVals = [191,191,191];
    else if (val<-0.1) imgVals = [219,219,219];
    else if (val<0) imgVals = [255,255,224];
    else if (val<0.025) imgVals = [255,250,204];
    else if (val<0.05) imgVals = [237,232,181];
    else if (val<0.075) imgVals = [222,217,156];
    else if (val<0.1) imgVals = [204,199,130];
    else if (val<0.125) imgVals = [188,184,107];
    else if (val<0.15) imgVals = [176,194,97];
    else if (val<0.175) imgVals = [163,204,89];
    else if (val<0.2) imgVals = [145,191,82];
    else if (val<0.25) imgVals = [128,179,72];
    else if (val<0.3) imgVals = [112,163,64];
    else if (val<0.35) imgVals = [97,150,53];
    else if (val<0.4) imgVals = [79,137,46];
    else if (val<0.45) imgVals = [64,125,36];
    else if (val<0.5) imgVals = [48,110,28];
    else if (val<0.55) imgVals = [33,97,18];
    else if (val<0.6) imgVals = [16,84,10];
    else imgVals = [0,69,0];

    // append mask (0 or 255)
    imgVals.push(sample.dataMask * 255);
    return imgVals;
}
"""

def _load_sh_config() -> SHConfig:
    """Load SHConfig from env variables if present, otherwise fallback to default config file.
       Ensure the sentinelhub config directory is writable (avoid PermissionError in containers).
    """
    import os

    # Ensure HOME is set to a writable directory inside container (fallback to /tmp)
    home = os.environ.get("HOME", None)
    if not home or not os.path.isdir(home) or not os.access(home, os.W_OK):
        # fallback
        os.environ["HOME"] = "/tmp"
        home = "/tmp"

    # ensure .config/sentinelhub exists and is writable
    cfg_dir = os.path.join(home, ".config", "sentinelhub")
    try:
        os.makedirs(cfg_dir, exist_ok=True)
    except Exception:
        # last resort: try /tmp/.config/sentinelhub
        cfg_dir = "/tmp/.config/sentinelhub"
        os.environ["HOME"] = "/tmp"
        os.makedirs(cfg_dir, exist_ok=True)

    config = SHConfig()

    # prefer environment variables (safer than hardcoding credentials)
    client_id = os.environ.get("SH_CLIENT_ID")
    client_secret = os.environ.get("SH_CLIENT_SECRET")
    base_url = os.environ.get("SH_BASE_URL") 
    
    if client_id and client_secret:
        config.sh_client_id = client_id
        config.sh_client_secret = client_secret
    if base_url:
        config.sh_base_url = base_url

    # Optionally: set token url for Copernicus Data Space
    token_url = os.environ.get("SH_TOKEN_URL")
    if token_url:
        config.sh_token_url = token_url

    return config

def generate_ndvi_png_bytes(
    bbox_wgs84: Tuple[float, float, float, float],
    time_interval: Tuple[str, str] = ("2024-07-01", "2024-07-30"),
    resolution: int = 10,
    config: Optional[SHConfig] = None,
) -> bytes:
    """
    Generate an NDVI PNG (RGBA) for the given bbox (x1, y1, x2, y2 in WGS84 lon/lat).
    Returns PNG bytes ready to be served (Content-Type: image/png).
    """
    if config is None:
        config = _load_sh_config()

    # create bbox and compute pixel dimensions
    aoi_bbox = BBox(bbox=bbox_wgs84, crs=CRS.WGS84)
    size = bbox_to_dimensions(aoi_bbox, resolution=resolution)
    # build request
    request = SentinelHubRequest(
        evalscript=EVALSCRIPT_NDVI,
        input_data=[
            SentinelHubRequest.input_data(
                data_collection=DataCollection.SENTINEL2_L2A.define_from(
                    name="s2l2a", service_url=os.environ.get("SH_BASE_URL")
                ),
                time_interval=time_interval,
                other_args={"dataFilter": {"mosaickingOrder": "leastCC"}},
            )
        ],
        responses=[SentinelHubRequest.output_response("default", MimeType.PNG)],
        bbox=aoi_bbox,
        size=size,
        config=config,
        # If you expect large images you may want to set maxcc or mosaicking order etc.
    )

    data = request.get_data()
    if not data:
        raise RuntimeError("No data returned from Sentinel Hub request")

    element = data[0]

    # element could be either bytes (already PNG) or a numpy array HxWx4 (uint8)
    if isinstance(element, (bytes, bytearray)):
        png_bytes = bytes(element)
        return png_bytes

    # if numpy array, convert to PNG bytes
    if isinstance(element, np.ndarray):
        # ensure uint8
        arr = element
        if arr.dtype != np.uint8:
            arr = np.clip(arr, 0, 255).astype(np.uint8)

        image = Image.fromarray(arr, mode="RGBA")
        buf = io.BytesIO()
        image.save(buf, format="PNG")
        buf.seek(0)
        return buf.read()

    raise RuntimeError("Unknown response type from SentinelHubRequest.get_data()")