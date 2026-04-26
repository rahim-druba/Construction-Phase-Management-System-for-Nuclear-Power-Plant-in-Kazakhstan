from django.contrib import admin
from django.urls import path
from core import views # Импортируем все views сразу

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', views.home, name='home'),
    path('logistics/', views.logistics, name='logistics'),
    path('hr/', views.hr, name='hr'),
    # React sub-routes — serve hr.html so refresh/new-tab work
    path('dash/', views.hr_dash, name='hr_dash'),
    path('dash', views.hr_dash),
    path('control/', views.hr_control, name='hr_control'),
    path('control', views.hr_control),
    path('hse/', views.hr_dash, name='hr_hse'),
    path('hse', views.hr_dash),
    path('finance/', views.finance, name='finance'),
    path('3d/', views.view_3d, name='view_3d'),
    path('4d/', views.view_4d, name='view_4d'),
    path('risks/', views.risks, name='risks'),
    path('docs/', views.docs, name='docs'),
    path('api/mock-db-request/', views.api_hr_data, name='api_hr_data'),
]