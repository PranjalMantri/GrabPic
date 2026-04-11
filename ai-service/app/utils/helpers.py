import httpx

async def download_image(url: str) -> bytes:
    async with httpx.AsyncClient() as client:
        response = await client.get(url)

        if response.status_code == 200:
            return response.content
            
        raise Exception(f"Failed to download image with url: {url}")

def get_optimized_url(url: str) -> str:
    """Modifies Cloudinary URL to downscale for faster AI inference."""
    original_url = str(url)
    # if "cloudinary.com" in original_url:
    #     return original_url.replace("/upload/", "/upload/w_1024,c_limit,q_auto/")
    return original_url