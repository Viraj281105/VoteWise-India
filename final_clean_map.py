import json

with open('public/data/india_simplified.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Reconstruct a clean FeatureCollection
clean_data = {
    "type": "FeatureCollection",
    "features": []
}

for feature in data['features']:
    if feature['geometry'] and feature['geometry']['coordinates']:
        clean_feature = {
            "type": "Feature",
            "properties": feature['properties'],
            "geometry": feature['geometry']
        }
        clean_data['features'].append(clean_feature)

with open('public/data/india_simplified.json', 'w', encoding='utf-8') as f:
    json.dump(clean_data, f, separators=(',', ':'))

print(f"Re-cleaned GeoJSON. Features: {len(clean_data['features'])}")
