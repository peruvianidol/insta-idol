import json
import os
import cloudinary
import cloudinary.uploader

# Configure Cloudinary
cloudinary.config(
    cloud_name="CLOUD_NAME",  # Replace with your Cloudinary cloud name
    api_key="API_KEY",        # Replace with your Cloudinary API key
    api_secret="API_SECRET"   # Replace with your Cloudinary API secret
)

# Load the Instagram JSON file
input_json_path = "posts_1.json"  # Replace with the path to your JSON file
output_json_path = "cloudinary_metadata.json"
media_folder = "media/posts/"  # Folder where the media files are stored

def extract_metadata(item):
    """Extract relevant metadata from the Instagram JSON item."""
    metadata = {
        "title": item.get("title", ""),
        "creation_timestamp": item.get("creation_timestamp"),
    }

    # Extract latitude and longitude if available
    photo_metadata = item.get("media_metadata", {}).get("photo_metadata", {}).get("exif_data", [])
    for data in photo_metadata:
        if "latitude" in data and "longitude" in data:
            metadata["latitude"] = data["latitude"]
            metadata["longitude"] = data["longitude"]
            break

    return metadata

def upload_to_cloudinary(uri, metadata):
    """Upload a media file to Cloudinary and include metadata."""
    response = cloudinary.uploader.upload(
        uri,
        folder="insta-idol/",  # Optional folder in your Cloudinary account
        tags=["insta-idol"],
        context={
            "caption": metadata.get("title", ""),
            "creation_timestamp": metadata.get("creation_timestamp", ""),
            "latitude": metadata.get("latitude", ""),
            "longitude": metadata.get("longitude", "")
        }
    )
    return response["secure_url"]

def process_instagram_json():
    """Process the Instagram JSON and upload files to Cloudinary."""
    with open(input_json_path, "r") as file:
        data = json.load(file)

    uploaded_data = []

    for post in data:
        for media in post.get("media", []):
            # Ensure `uri` is relative to the `media_folder` without duplication
            if media["uri"].startswith(media_folder):
                uri = media["uri"]
            else:
                uri = os.path.join(media_folder, media["uri"])

            # Skip if the file doesn't exist
            if not os.path.exists(uri):
                print(f"File not found: {uri}")
                continue

            metadata = extract_metadata(media)

            try:
                cloudinary_url = upload_to_cloudinary(uri, metadata)
                metadata["cloudinary_url"] = cloudinary_url
                uploaded_data.append(metadata)

            except Exception as e:
                print(f"Failed to upload {uri}: {e}")

    # Save the uploaded metadata to a new JSON file
    with open(output_json_path, "w") as output_file:
        json.dump(uploaded_data, output_file, indent=4)

    print(f"Uploaded data saved to {output_json_path}")

if __name__ == "__main__":
    process_instagram_json()
