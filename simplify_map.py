import json
import os

def simplify_geometry(geom, factor=5):
    if geom['type'] == 'Polygon':
        new_coordinates = []
        for ring in geom['coordinates']:
            # Take every Nth point
            simplified = ring[::factor]
            # Ensure it closes properly and has minimum points
            if len(simplified) < 4:
                simplified = ring[:4] if len(ring) >= 4 else ring
            if simplified[-1] != simplified[0]:
                simplified.append(simplified[0])
            new_coordinates.append(simplified)
        return {'type': 'Polygon', 'coordinates': new_coordinates}
    elif geom['type'] == 'MultiPolygon':
        new_coordinates = []
        for polygon in geom['coordinates']:
            new_poly = []
            for ring in polygon:
                simplified = ring[::factor]
                if len(simplified) < 4:
                    simplified = ring[:4] if len(ring) >= 4 else ring
                if simplified[-1] != simplified[0]:
                    simplified.append(simplified[0])
                new_poly.append(simplified)
            new_coordinates.append(new_poly)
        return {'type': 'MultiPolygon', 'coordinates': new_coordinates}
    return geom

input_path = 'public/data/india_state.json'
output_path = 'public/data/india_simplified.json'

if os.path.exists(input_path):
    with open(input_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    if data['type'] == 'FeatureCollection':
        for feature in data['features']:
            # Use a slightly lower factor to preserve detail and avoid artifacts
            feature['geometry'] = simplify_geometry(feature['geometry'], factor=4)
            # Standardize properties
            props = feature['properties']
            name = props.get('name') or props.get('st_nm') or props.get('NAME_1') or props.get('STATE')
            feature['properties'] = {'name': name}
            
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, separators=(',', ':'))
    
    print(f"Simplified {input_path} to {output_path}")
    print(f"Original size: {os.path.getsize(input_path) / 1024 / 1024:.2f} MB")
    print(f"New size: {os.path.getsize(output_path) / 1024 / 1024:.2f} MB")
else:
    print(f"Input file {input_path} not found")
