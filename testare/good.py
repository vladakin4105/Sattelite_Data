
import ee
import folium
from IPython.display import display
from datetime import datetime, timedelta
import math
# timezone support (Python 3.9+). If not available, fallback to UTC.
try:
    from zoneinfo import ZoneInfo
    BUC_ZONE = ZoneInfo("Europe/Bucharest")
except Exception:
    BUC_ZONE = None
    print("zoneinfo not available; falling back to UTC for date calculation.")



# Initialize Earth Engine
try:
    ee.Initialize(project='sattelite-learn')
    print("Earth Engine initialized successfully!")
except Exception as e:
    print(f"Error initializing Earth Engine: {e}")
    print("Make sure you have authenticated with: ee.Authenticate()")

# --- helper: haversine distance (meters) ---
def haversine_m(lon1, lat1, lon2, lat2):
    R = 6371000.0  # Earth radius in meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi/2.0)**2 + math.cos(phi1)*math.cos(phi2)*(math.sin(dlambda/2.0)**2)
    return 2 * R * math.asin(math.sqrt(a))

# --- compute minimal buffer radius (m) so that point-buffer covers bbox ---
def required_buffer_for_bbox_m(center_lon, center_lat, bbox, margin_m=1000):
    """
    bbox = [minLon, minLat, maxLon, maxLat]
    margin_m = extra meters to add as safety margin
    returns: radius in meters
    """
    minLon, minLat, maxLon, maxLat = bbox
    corners = [
        (minLon, minLat),
        (minLon, maxLat),
        (maxLon, minLat),
        (maxLon, maxLat)
    ]
    dists = [haversine_m(center_lon, center_lat, c_lon, c_lat) for (c_lon, c_lat) in corners]
    maxd = max(dists)
    return int(math.ceil(maxd + margin_m))

def get_dynamic_world_availability(region):
    """
    Check the temporal availability of Dynamic World data for a given region.
    """
    dw_col = ee.ImageCollection('GOOGLE/DYNAMICWORLD/V1').filterBounds(region)
    
    try:
        # Get the first and last images to understand temporal coverage
        first_img = ee.Image(dw_col.sort('system:time_start').first())
        last_img = ee.Image(dw_col.sort('system:time_start', False).first())
        
        first_date = first_img.date().format('YYYY-MM-dd').getInfo()
        last_date = last_img.date().format('YYYY-MM-dd').getInfo()
        total_images = dw_col.size().getInfo()
        
        print(f"Dynamic World temporal coverage:")
        print(f"  First image: {first_date}")
        print(f"  Last image: {last_date}")
        print(f"  Total images: {total_images}")
        
        return first_date, last_date, total_images
    except Exception as e:
        print(f"Error checking Dynamic World availability: {e}")
        return None, None, 0

def choose_sentinel_collection(region, start_date, end_date, cloud_thresh=35):
    """
    Try a list of Sentinel-2 collections and return the first non-empty filtered collection.
    """
    candidates = [
        'COPERNICUS/S2_SR_HARMONIZED',
        'COPERNICUS/S2_SR',
        'COPERNICUS/S2'  # fallback (deprecated); kept last
    ]
    for cid in candidates:
        try:
            col = ee.ImageCollection(cid).filterBounds(region).filterDate(start_date, end_date)
            # apply basic cloud filter if property exists
            col = col.filter(ee.Filter.lte('CLOUDY_PIXEL_PERCENTAGE', cloud_thresh))
            size = col.size().getInfo()
            print(f"Collection {cid} has {size} images for AOI/date.")
            if size and int(size) > 0:
                print(f"Using collection: {cid}")
                return col, cid
        except Exception as e:
            print(f"Collection {cid} not available or error: {e}")
    # If none found, return empty first candidate as fallback
    return ee.ImageCollection(candidates[0]).filterBounds(region).filterDate(start_date, end_date), candidates[0]

def suggest_alternative_dates(region, preferred_start, preferred_end):
    """
    Suggest alternative date ranges where Dynamic World data is available.
    """
    print("\nSuggesting alternative date ranges...")
    
    # Try a few recent example windows (kept static)
    recent_dates = [
        ('2023-06-01', '2023-06-30'),
        ('2023-04-01', '2023-04-30'),
        ('2022-08-01', '2022-08-31'),
        ('2022-06-01', '2022-06-30'),
    ]
    
    for start, end in recent_dates:
        dw_col = ee.ImageCollection('GOOGLE/DYNAMICWORLD/V1').filterBounds(region).filterDate(start, end)
        count = dw_col.size().getInfo()
        if count > 0:
            print(f"  Available: {start} to {end} ({count} images)")
            return start, end
        else:
            print(f"  Not available: {start} to {end}")
    
    return None, None

def create_dynamic_world_visualization(lon, lat, start_date, end_date,
                                       zoom_level=13, region_buffer_m=5000, temporal_window_days=10,
                                       bbox=None, auto_suggest_dates=True):
    """
    If bbox is provided (minLon, minLat, maxLon, maxLat), the function:
      - computes the minimal buffer around point to cover bbox
      - uses bbox as the clipping region (ensures displayed layer is clipped to bbox)
      - filters imagery by bbox (so we only pick images that intersect bbox)
    If bbox is None, behavior falls back to buffer (circle) around the point.
    """
    point = ee.Geometry.Point(lon, lat)

    # If bbox is given, compute required buffer and set region to the rectangle
    if bbox is not None:
        # compute minimal buffer to fully cover bbox (in meters)
        required_buffer = required_buffer_for_bbox_m(lon, lat, bbox, margin_m=500)
        print(f"Computed required buffer to cover bbox: {required_buffer} m (auto).")
        region = ee.Geometry.Rectangle(bbox)
        # We'll still use a small buffer for some filters if needed:
        region_buffer_m = max(region_buffer_m, required_buffer)
        # For clipping and strict filtering use the rectangle
        clip_region = region
    else:
        # no bbox: use circular buffer around point
        region_buffer_m = region_buffer_m
        region = point.buffer(region_buffer_m).bounds()
        clip_region = region

    print(f"Using region buffer (m): {region_buffer_m}")
    print("Filtering Dynamic World images that intersect the region (rectangle or buffered circle)...")

    # Filter Dynamic World to the region (rectangle) and date range
    dw_col = ee.ImageCollection('GOOGLE/DYNAMICWORLD/V1').filterBounds(region).filterDate(start_date, end_date)
    dw_count = dw_col.size().getInfo()
    print(f"Dynamic World images overlapping region for {start_date} to {end_date}: {dw_count}")

    if dw_count == 0 and auto_suggest_dates:
        # same suggestion logic you had (this can remain unchanged)
        alt_start, alt_end = suggest_alternative_dates(region, start_date, end_date)
        if alt_start and alt_end:
            print(f"Trying alternative dates: {alt_start} to {alt_end}")
            start_date, end_date = alt_start, alt_end
            dw_col = ee.ImageCollection('GOOGLE/DYNAMICWORLD/V1').filterBounds(region).filterDate(start_date, end_date)
            dw_count = dw_col.size().getInfo()
            print(f"Dynamic World images found with alternative dates: {dw_count}")

    if dw_count == 0:
        print("No Dynamic World images found for this AOI/date range. Consider expanding date range or buffer.")
        return None

    # Choose S2 collection similarly (try harmonized etc.)
    s2_col, chosen_cid = choose_sentinel_collection(region, start_date, end_date, cloud_thresh=35)
    print(f"Chosen Sentinel collection: {chosen_cid}; images: {s2_col.size().getInfo()}")

    # Join by temporal proximity
    max_diff_millis = int(temporal_window_days * 24 * 60 * 60 * 1000)
    timeFilter = ee.Filter.maxDifference(difference=max_diff_millis,
                                         leftField='system:time_start',
                                         rightField='system:time_start')
    dw_s2_col = ee.Join.saveFirst('s2_img').apply(dw_col, s2_col, timeFilter)

    # ensure collection images intersect the point or rectangle
    if bbox is not None:
        # force filter by rectangle
        dw_s2_col = dw_s2_col.filterBounds(ee.Geometry.Rectangle(bbox))
    else:
        dw_s2_col = dw_s2_col.filterBounds(point)

    joined_size = dw_s2_col.size().getInfo()
    print(f"Joined images (temporal match & intersecting region): {joined_size}")

    # pick most recent DW image that intersects region
    if joined_size > 0:
        dw_image = ee.Image(dw_s2_col.sort('system:time_start', False).first())
        s2_img_obj = dw_image.get('s2_img')
        s2_image = ee.Image(s2_img_obj) if s2_img_obj else None
    else:
        dw_image = ee.Image(dw_col.sort('system:time_start', False).first())
        s2_image = None

    # Clip the images to the bounding box (if provided) or to the small region
    try:
        dw_image_clipped = dw_image.clip(clip_region)
    except Exception as e:
        print("Warning: could not clip DW image; using original. Error:", e)
        dw_image_clipped = dw_image

    if s2_image is not None:
        try:
            s2_image_clipped = s2_image.clip(clip_region)
        except Exception as e:
            print("Warning: could not clip S2 image; using original. Error:", e)
            s2_image_clipped = s2_image
    else:
        s2_image_clipped = None

    # Optional: check how much of bbox is actually covered by the DW image
    if bbox is not None:
        rect = ee.Geometry.Rectangle(bbox)
        try:
            rect_area = rect.area().getInfo()
            inter_area = dw_image.geometry().intersection(rect, 1).area().getInfo()
            coverage_pct = (inter_area / rect_area) * 100 if rect_area and rect_area > 0 else 0
            print(f"DW image covers {coverage_pct:.1f}% of the requested bbox area.")
            if coverage_pct < 95:
                print("Warning: DW image does NOT fully cover your bbox. Consider enlarging temporal window, buffer, or using multiple tiles.")
        except Exception as e:
            print("Could not compute coverage percentage (server issue):", e)

    # Visualization (same as before but using clipped images)
    class_names = [
        'water','trees','grass','flooded_vegetation','crops',
        'shrub_and_scrub','built','bare','snow_and_ice'
    ]
    vis_palette = ['419BDF','397D49','88B053','7A87C6','E49635','DFC35A','C4281B','A59B8F','B39FE1']

    dw_rgb = dw_image_clipped.select('label').visualize(min=0, max=8, palette=vis_palette).divide(255)
    top1_prob = dw_image_clipped.select(class_names).reduce(ee.Reducer.max())
    dw_rgb_hillshade = dw_rgb.multiply(ee.Terrain.hillshade(top1_prob.multiply(100)).divide(255))

    m = folium.Map(location=[lat, lon], zoom_start=zoom_level)

    if s2_image_clipped is not None:
        try:
            s2_vis_params = {'min': 0, 'max': 3000, 'bands': ['B4','B3','B2']}
            s2_map_id = s2_image_clipped.getMapId(s2_vis_params)
            folium.raster_layers.TileLayer(tiles=s2_map_id['tile_fetcher'].url_format,
                                          attr='GEE', name=f'Sentinel-2 ({chosen_cid})',
                                          overlay=True, control=True).add_to(m)
        except Exception as e:
            print("Could not add S2 layer:", e)

    try:
        dw_map_id = dw_rgb_hillshade.getMapId({'min':0,'max':0.65})
        folium.raster_layers.TileLayer(tiles=dw_map_id['tile_fetcher'].url_format,
                                      attr='GEE', name='Dynamic World', overlay=True, control=True).add_to(m)
    except Exception as e:
        print("Could not add DW layer:", e)

    # Draw bbox or region used
    if bbox is not None:
        coords = [[bbox[1], bbox[0]], [bbox[1], bbox[2]], [bbox[3], bbox[2]], [bbox[3], bbox[0]]]
        folium.Polygon(locations=[[c[0], c[1]] for c in coords], color='blue', weight=2, fill=False, popup='Requested BBOX').add_to(m)
    else:
        # draw the buffer rectangle
        region_coords = region.getInfo()['coordinates'][0]
        latlon_bounds = [[c[1], c[0]] for c in region_coords]
        folium.Polygon(locations=latlon_bounds, color='blue', weight=2, fill=False, popup='AOI (buffered)').add_to(m)

    folium.Marker([lat, lon], popup=f'Center: {lat}, {lon}').add_to(m)
    folium.LayerControl().add_to(m)

    # legend (same as before) ...
    # (omitted for brevity; reuse your legend_html creation)

    return m, dw_image_clipped, s2_image_clipped, region, (dw_image.date().format('YYYY-MM-dd').getInfo() if hasattr(dw_image, 'date') else 'unknown')



# Helper: compute last 30 days relative to current date in Bucharest (fallback to UTC)
def last_n_days_dates(n=30):
    if BUC_ZONE is not None:
        today = datetime.now(BUC_ZONE).date()
    else:
        today = datetime.utcnow().date()
    start = today - timedelta(days=n)
    # Format as YYYY-MM-DD strings (Earth Engine expects ISO-like dates)
    return start.strftime('%Y-%m-%d'), today.strftime('%Y-%m-%d')

# Example usage
if __name__ == "__main__":
    #test_lon = 26.1025
    #test_lat = 44.4268

    # Compute start/end as last 30 days relative to script run date
    start_date, end_date = last_n_days_dates(30)
    print(f"Using date range (last 30 days): {start_date} to {end_date}")

    print("Creating Dynamic World visualization around Bucharest...")
    print("If no data is found for the specified dates, alternative dates will be suggested.")
    
    # bbox format: [minLon, minLat, maxLon, maxLat]
    # e.g. small bbox around Bucharest (approx)
    example_bbox = [25.95, 44.35, 26.25, 44.55]  
    test_lat = (44.35+44.55)/2.0
    test_lon = (25.95+26.25)/2.0
    result = create_dynamic_world_visualization(
        test_lon, test_lat, start_date, end_date,
        zoom_level=12, region_buffer_m=100000, temporal_window_days=10,bbox=example_bbox,
        auto_suggest_dates=True
    )  

    if result is not None:
        map_viz, dw_img, s2_img, region, dw_date = result
        display(map_viz)
        filename = f'dynamic_world_bucharest_{dw_date}.html'
        map_viz.save(filename)
        print(f"Map saved as '{filename}'")
        
        # Print some statistics
        print(f"\nVisualization created successfully!")
        print(f"Dynamic World image date: {dw_date}")
        if s2_img is not None:
            s2_date = s2_img.date().format('YYYY-MM-dd').getInfo()
            print(f"Sentinel-2 image date: {s2_date}")
        else:
            print("No matching Sentinel-2 image found")
    else:
        print("No visualization created. See messages above for why.")
        print("\nTroubleshooting tips:")
        print("1. Try running with more recent dates (2022-2025)")
        print("2. Increase the region buffer (e.g., region_buffer_m=200000)")
        print("3. Increase the temporal window (e.g., temporal_window_days=30)")