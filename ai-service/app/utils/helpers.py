import httpx

async def download_image(url: str) -> bytes:
    async with httpx.AsyncClient() as client:
        response = await client.get(url)

        if response.status_code == 200:
            return response.content
            
        raise Exception(f"Failed to download image with url: {url}")
