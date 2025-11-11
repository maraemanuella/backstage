from django.contrib import admin
from .models import WaitlistEntry

@admin.register(WaitlistEntry)
class WaitlistEntryAdmin(admin.ModelAdmin):
    list_display = ('usuario', 'evento', 'status', 'created_at', 'notified_at', 'expires_at')
    list_filter = ('status', 'created_at')
    search_fields = ('usuario__username', 'evento__titulo')
    date_hierarchy = 'created_at'

