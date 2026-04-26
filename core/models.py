from django.db import models

class Zone(models.Model):
    code = models.CharField(max_length=10, unique=True) # Например: "RB", "TH"
    name = models.CharField(max_length=100)
    discipline = models.CharField(max_length=50)
    progress = models.IntegerField(default=0)
    status = models.CharField(max_length=20)

class Task(models.Model):
    task_id = models.CharField(max_length=20, unique=True)
    title = models.CharField(max_length=100)
    skill = models.CharField(max_length=50)
    needed = models.IntegerField(default=0)
    zone_code = models.CharField(max_length=10)
    priority = models.CharField(max_length=20)
    deadline_days = models.IntegerField(default=0)

class Worker(models.Model):
    employee_id = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=100)
    skill = models.CharField(max_length=50)
    discipline = models.CharField(max_length=50)
    zone_code = models.CharField(max_length=10)
    available = models.BooleanField(default=True)
    shift = models.CharField(max_length=10)
    days_worked = models.IntegerField(default=0)
    fatigue = models.IntegerField(default=0)
    origin = models.CharField(max_length=20)
    cert_name = models.CharField(max_length=50)
    cert_status = models.CharField(max_length=20)
    cert_expires_in_days = models.IntegerField(default=0)
    years_experience = models.IntegerField(default=0)

class OpenPosition(models.Model):
    pos_id = models.CharField(max_length=20, unique=True)
    role = models.CharField(max_length=50)
    needed = models.IntegerField(default=0)
    applicants = models.IntegerField(default=0)
    days_open = models.IntegerField(default=0)
    urgency = models.CharField(max_length=20)
    source = models.CharField(max_length=20)

class RecentHire(models.Model):
    name = models.CharField(max_length=100)
    role = models.CharField(max_length=50)
    started_days_ago = models.IntegerField(default=0)
    origin = models.CharField(max_length=20)
    onboarding_pct = models.IntegerField(default=0)

class HiringTrend(models.Model):
    month = models.CharField(max_length=20)
    hired = models.IntegerField(default=0)
    attrited = models.IntegerField(default=0)
    order = models.IntegerField(default=0)