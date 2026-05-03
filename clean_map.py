import json

with open('public/data/india_simplified.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

new_features = []
for feature in data['features']:
    geom = feature['geometry']
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
        
        # India bounds: Lon[68, 98], Lat[6, 38]
        if 60 < min_lon < 100 and 5 < min_lat < 40:
            new_features.append(feature)
        else:
            print(f"Removing outlier: {feature['properties'].get('name')} at Lon:{min_lon}, Lat:{min_lat}")

data['features'] = new_features

with open('public/data/india_simplified.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, separators=(',', ':'))

print(f"Cleaned GeoJSON. Now has {len(new_features)} features.")
