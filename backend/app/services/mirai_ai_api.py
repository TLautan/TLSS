# backend/app/services/mirai_ai_api.py

# 開発中「計画未定」
'''
import httpx
import os
from typing import List, Dict, Any

CRM_API_URL = os.getenv("MIRAIAI_API_URL")
CRM_API_KEY = os.getenv("MIRAIAI_API_KEY")

client = httpx.AsyncClient(
    base_url=CRM_API_URL,
    headers={"Authorization": f"Bearer {CRM_API_KEY}"}
)

async def get_all_deals_from_crm() -> List[Dict[str, Any]]:
    """
    Fetches all 'deal' records from the external CRM API.
    """
    try:
        response = await client.get("/deals")
        response.raise_for_status()
        return response.json()
    except httpx.RequestError as exc:
        print(f"An error occurred while requesting {exc.request.url!r}.")
        return []
    except httpx.HTTPStatusError as exc:
        print(f"Error response {exc.response.status_code} while requesting {exc.request.url!r}.")
        return []

async def get_company_by_id_from_crm(company_id: int) -> Dict[str, Any]:
    """
    Fetches a single company record from the external CRM.
    """
    try:
        response = await client.get(f"/companies/{company_id}")
        response.raise_for_status()
        return response.json()
    except httpx.HTTPStatusError:
        return {}
'''