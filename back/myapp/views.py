from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import PotholeData
from .serializers import PotholeDataSerializer
from django.utils.timezone import now
from datetime import timedelta
from .utils import compute_road_risk
import json
@api_view(['GET'])
def count_today(request):
    today = now().date()
    count = PotholeData.objects.filter(created_at__date=today).count()
    return Response({'count': count})

@api_view(["GET"])
def roads_view(request):
    geojson = compute_road_risk()
    return Response(json.loads(geojson))  # ✅ Renderer-aware 방식

@api_view(['GET'])
def potholes_by_region(request):
    name = request.GET.get('name')
    potholes = PotholeData.objects.filter(region__icontains=name)
    serializer = PotholeDataSerializer(potholes, many=True)
    return Response(serializer.data)

@api_view(['POST'])
def save_yolo(request):
    serializer = PotholeDataSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)

@api_view(['GET'])
def get_by_id(request, id):
    try:
        pothole = PotholeData.objects.get(pk=id)
        serializer = PotholeDataSerializer(pothole)
        return Response(serializer.data)
    except PotholeData.DoesNotExist:
        return Response({'error': 'Not found'}, status=404)


@api_view(['PATCH'])
def update_status(request, id):
    try:
        pothole = PotholeData.objects.get(pk=id)
        new_status = request.data.get('status')
        pothole.status = new_status
        pothole.save()
        return Response({'status': 'updated'})
    except PotholeData.DoesNotExist:
        return Response({'error': 'Not found'}, status=404)
