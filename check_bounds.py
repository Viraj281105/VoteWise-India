import json

with open('public/data/india_simplified.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

for i, feature in enumerate(data['features']):
    geom = feature['geometry']
    name = feature['properties'].get('name')
    
    # Calculate bounds
    lons = []
    lats = []
    
    def extract_coords(coords):
        for item in coords:
            if isinstance(item[0], list):
                extract_coords(item)
            else:
                lons.append(item[0])
                lats.append(item[1])
    
    extract_coords(geom['coordinates'])
    
    if lons:
        min_lon, max_lon = min(lons), max(lons)
        min_lat, max_lat = min(lats), max(lats)
        print(f"Feature {i} ({name}): Lon[{min_lon:.2f}, {max_lon:.2f}], Lat[{min_lat:.2f}, {max_lat:.2f}]")
        if min_lon < 60 or max_lon > 100 or min_lat < 5 or max_lat > 40:
            print(f"  !!! OUTLIER DETECTED !!!")
