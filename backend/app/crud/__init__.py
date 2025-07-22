# app/crud/__init__.py

from .crud_user import *
from .crud_company import *
from .crud_agency import *
from .crud_deal import *
from .crud_activity import *

# This imports all functions from your crud files.
# Alternatively, a more explicit approach is often better:

from . import crud_user as user
from . import crud_company as company
from . import crud_agency as agency
from . import crud_deal as deal
from . import crud_activity as activity