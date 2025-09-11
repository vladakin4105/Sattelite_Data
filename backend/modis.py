import os
from dotenv import load_dotenv
import ee


class MODISAnalyzer:
    def __init__(self, bbox):
        self.bbox = bbox
        self.geometry = ee.Geometry.Rectangle(bbox)

        self.lc_colors = {
            0: "#0B43D2",   # Water
            1: '#086a10',   # Evergreen Needleleaf Forests
            2: '#54a708',   # Evergreen Broadleaf Forests
            3: '#78d203',   # Deciduous Needleleaf Forests
            4: '#009900',   # Deciduous Broadleaf Forests
            5: '#c6b044',   # Mixed Forests
            6: '#dcd159',   # Closed Shrublands
            7: '#dade48',   # Open Shrublands
            8: '#fbff13',   # Woody Savannas
            9: '#b6ff05',   # Savannas
            10: '#27ff87',  # Grasslands
            11: '#c24f44',  # Permanent Wetlands
            12: "#f8cd0a",  # Croplands
            13: "#a5a6a6",  # Urban and Built-up Lands
            14: '#69fff8',  # Cropland/Natural Vegetation Mosaics
            15: "#98d6ff",  # Permanent Snow and Ice
            16: "#000000"   # Barren
        }
        self.lc_names = {
            0: 'Water bodies',
            1: 'Evergreen Needleleaf Forests',
            2: 'Evergreen Broadleaf Forests',
            3: 'Deciduous Needleleaf Forests',
            4: 'Deciduous Broadleaf Forests',
            5: 'Mixed Forests',
            6: 'Closed Shrublands',
            7: 'Open Shrublands',
            8: 'Woody Savannas',
            9: 'Savannas',
            10: 'Grasslands',
            11: 'Permanent Wetlands',
            12: 'Croplands',
            13: 'Urban and Built-up Lands',
            14: 'Cropland/Natural Vegetation Mosaics',
            15: 'Permanent Snow and Ice',
            16: 'Unclassified'
        }

    def get_modis_data(self, year=2024,lc_type=2):
        collection = ee.ImageCollection('MODIS/061/MCD12Q1')

        start_date = f'{year}-01-01'
        end_date = f'{year}-12-31'

        modis_image = collection.filterDate(start_date, end_date).filterBounds(self.geometry).first()

        lc_band = f'LC_Type{lc_type}'
        return modis_image.select(lc_band).clip(self.geometry)
    
    def analyze_land_cover(self, year=2024):
        modis_image = self.get_modis_data(year)
        histogram = modis_image.reduceRegion(
            reducer=ee.Reducer.frequencyHistogram(),
            geometry=self.geometry,
            scale=500,
            maxPixels=1e9
        )
        
        lc_hist = histogram.getInfo()[f'LC_Type2']

        if lc_hist is None:
            print("Nu există date pentru zona specificată.")
            return None
        
        stats = {}
        total_pixels = sum(lc_hist.values())

        for lc_class, pixel_count in lc_hist.items():
            lc_class = int(lc_class)
            if lc_class in self.lc_names:
                percentage = (pixel_count / total_pixels) * 100
                stats[self.lc_names[lc_class]] = {
                    'pixels': pixel_count,
                    'percentage': percentage,
                    'area_km2': (pixel_count * 0.25)
                }
        return stats
    

    def _create_legend_html(self):
        """Creează HTML-ul pentru legendă"""
        legend_html = '''
        <div style="position: fixed; 
                    bottom: 50px; left: 50px; width: 300px; height: 400px; 
                    background-color: white; border:2px solid grey; z-index:9999; 
                    font-size:14px; padding: 10px; overflow-y: scroll;">
        <h4>Acoperire terestră MODIS</h4>
        '''
        
        for class_id, color in self.lc_colors.items():
            if class_id in self.lc_names:
                legend_html += f'''
                <p><span style="color:{color}; font-size: 20px;">■</span> 
                {self.lc_names[class_id]}</p>
                '''
        
        legend_html += '</div>'
        return legend_html

def authenticate_earth_engine():
    load_dotenv()

    credentials_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
    project_id = os.getenv("GOOGLE_CLOUD_PROJECT")

    credentials = ee.ServiceAccountCredentials(None, credentials_path)
    ee.Initialize(credentials, project=project_id)

def main(bbox=None):
    if not ee.data._initialized:
        try:
            authenticate_earth_engine()
            print("Earth Engine authenticated successfully.")
        except Exception as e:
            print(f"Eroare la inițializarea GEE: {e}")
            return None, None

    if bbox is None:
        print("Nu s-a furnizat nicio bounding box.")
        return None, None

    
    try:
        analyzer = MODISAnalyzer(bbox)
        stats = analyzer.analyze_land_cover(year=2024)
        
        if stats:
            for lc_type, data in stats.items():
                print(f"{lc_type}: {data['pixels']} pixeli, {data['percentage']:.2f}%, {data['area_km2']:.2f} km²")
            
            
            return analyzer, stats
        else:
            print("Nu s-au găsit date de acoperire terestră pentru zona specificată.")
            return None, None
            
    except Exception as e:
        print(f"Eroare la inițializarea analizei: {e}")
        return None, None



if __name__ == "__main__":
    main()
