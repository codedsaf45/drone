from django.urls import path
from . import views

urlpatterns = [
    path('count/today', views.count_today),
    path('region', views.potholes_by_region),
    path('yolo', views.save_yolo),
    path("roads/", views.roads_view),
    
    path('<int:id>', views.get_by_id),
    path('<int:id>/status', views.update_status),
]
