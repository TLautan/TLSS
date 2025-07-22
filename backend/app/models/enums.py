# app/models/enums.py
import enum

class ActivityType(str, enum.Enum):
    phone = "電話"
    email = "メール"
    meeting = "会議"

class DealStatus(str, enum.Enum):
    in_progress = "進行中"
    won = "受注"
    lost = "失注"
    cancelled = "キャンセル"

class DealType(str, enum.Enum):
    direct = "direct"
    agency = "agency"

class ForecastAccuracy(str, enum.Enum):
    high = "高"
    medium = "中"
    low = "低"