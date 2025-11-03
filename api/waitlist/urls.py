from django.urls import path
from api.waitlist.views import (
    waitlist_status,
    waitlist_join,
    waitlist_leave,
    waitlist_suggestions,
)

urlpatterns = [
    path('<uuid:event_id>/status/', waitlist_status, name='waitlist-status'),
    path('<uuid:event_id>/join/', waitlist_join, name='waitlist-join'),
    path('<uuid:event_id>/leave/', waitlist_leave, name='waitlist-leave'),
    path('<uuid:event_id>/suggestions/', waitlist_suggestions, name='waitlist-suggestions'),
]
