import json
from collections import defaultdict

# Load the input JSON file
input_file = "cloudinary_metadata.json"  # Update with your actual file name
output_file = "grouped_metadata.json"

with open(input_file, "r") as file:
    data = json.load(file)

# Group data by creation_timestamp
grouped_data = defaultdict(lambda: {"title": "", "latitude": None, "longitude": None, "media": []})

for item in data:
    timestamp = item["creation_timestamp"]
    if "title" in item and item["title"]:
        grouped_data[timestamp]["title"] = item["title"]
    if "latitude" in item:
        grouped_data[timestamp]["latitude"] = item["latitude"]
    if "longitude" in item:
        grouped_data[timestamp]["longitude"] = item["longitude"]
    grouped_data[timestamp]["media"].append(item["cloudinary_url"])

# Convert grouped data back to a list
output_data = [
    {"creation_timestamp": ts, **details}
    for ts, details in grouped_data.items()
]

# Save the output to a new JSON file
with open(output_file, "w") as file:
    json.dump(output_data, file, indent=4)

print(f"Grouped data saved to {output_file}")
