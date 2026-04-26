from django.shortcuts import render, redirect
from django.http import JsonResponse
from .models import Zone, Task, Worker, OpenPosition, RecentHire, HiringTrend


# --- ТВОИ ОБЫЧНЫЕ СТРАНИЦЫ ---
def home(request): return render(request, 'home.html')

def logistics(request): return render(request, 'logistics.html')

def hr(request): return render(request, 'hr.html')

# React sub-routes inside the HR app — serve the same template;
# React client-side router takes over after hydration.
def hr_dash(request): return render(request, 'hr.html')
def hr_control(request): return render(request, 'hr.html')

def finance(request): return render(request, 'finance.html')

def view_3d(request): return render(request, '3d_view.html')

def view_4d(request): return render(request, '4d_view.html')

def risks(request): return render(request, 'risks.html')

def docs(request): return render(request, 'docs.html')


# --- ФУНКЦИЯ ДЛЯ ГЕНЕРАЦИИ БАЗЫ ДАННЫХ ---
def seed_database():
    if Worker.objects.exists():
        return  # База уже заполнена, ничего не делаем

    # 1. Создаем Зоны
    zones_data = [
        {"code": "RB", "name": "Reactor Building", "discipline": "Civil", "progress": 62, "status": "on-track"},
        {"code": "TH", "name": "Turbine Hall", "discipline": "Mechanical", "progress": 48, "status": "delayed"},
        {"code": "CT", "name": "Cooling Tower", "discipline": "Civil", "progress": 81, "status": "on-track"},
        {"code": "AB", "name": "Auxiliary Building", "discipline": "Mechanical", "progress": 70, "status": "on-track"},
        {"code": "SY", "name": "Switchyard", "discipline": "Electrical", "progress": 55, "status": "at-risk"},
        {"code": "CR", "name": "Control Room", "discipline": "I&C", "progress": 38, "status": "delayed"}
    ]
    for zd in zones_data: Zone.objects.create(**zd)

    # 2. Создаем Задачи
    tasks_data = [
        {"task_id": "T-101", "title": "Primary Loop Pipe Welding", "skill": "Welder", "needed": 8, "zone_code": "TH",
         "priority": "critical", "deadline_days": 4},
        {"task_id": "T-102", "title": "Reactor Vessel Rebar Tying", "skill": "Rebar Fitter", "needed": 12,
         "zone_code": "RB", "priority": "high", "deadline_days": 7},
        {"task_id": "T-103", "title": "Cable Tray Installation", "skill": "Electrician", "needed": 6, "zone_code": "SY",
         "priority": "high", "deadline_days": 5},
        {"task_id": "T-104", "title": "Containment Concrete Pour", "skill": "Concrete Worker", "needed": 14,
         "zone_code": "RB", "priority": "critical", "deadline_days": 3},
        {"task_id": "T-105", "title": "Crane Lift — Steam Generator", "skill": "Crane Operator", "needed": 3,
         "zone_code": "TH", "priority": "critical", "deadline_days": 2},
        {"task_id": "T-106", "title": "Scaffolding for Dome Lining", "skill": "Scaffolder", "needed": 10,
         "zone_code": "RB", "priority": "medium", "deadline_days": 9}
    ]
    for td in tasks_data: Task.objects.create(**td)

    # 3. Дополнительные данные
    OpenPosition.objects.create(pos_id="P-01", role="Welder", needed=6, applicants=18, days_open=9, urgency="critical",
                                source="local")
    OpenPosition.objects.create(pos_id="P-02", role="Crane Operator", needed=2, applicants=5, days_open=14,
                                urgency="critical", source="foreign")
    OpenPosition.objects.create(pos_id="P-03", role="Electrician", needed=4, applicants=22, days_open=7, urgency="high",
                                source="local")

    RecentHire.objects.create(name="Aibek Nurmagambetov", role="Welder", started_days_ago=3, origin="local",
                              onboarding_pct=35)
    RecentHire.objects.create(name="Hyun-woo Kim", role="I&C Technician", started_days_ago=6, origin="foreign",
                              onboarding_pct=60)
    RecentHire.objects.create(name="Madina Bekova", role="Safety Officer", started_days_ago=8, origin="local",
                              onboarding_pct=70)

    for i, month in enumerate(["Nov", "Dec", "Jan", "Feb", "Mar", "Apr"]):
        HiringTrend.objects.create(month=month, hired=random.randint(10, 30), attrited=random.randint(2, 8), order=i)

    # 4. ГЕНЕРИРУЕМ 250 РАБОЧИХ
    names_m = ["Aibek", "Dauren", "Yerlan", "Nurlan", "Bauyrzhan", "Sergey", "Ivan", "Dmitry", "Mehmet", "Igor",
               "Sultan", "Nikolay"]
    names_l = ["Nurmagambetov", "Tokayev", "Iskakov", "Volkov", "Smirnov", "Yılmaz", "Chen", "Popov", "Morozov",
               "Karimov"]
    skills = [
        {"name": "Welder", "disc": "Mechanical", "cert": "Weld License"},
        {"name": "Electrician", "disc": "Electrical", "cert": "HV Elec"},
        {"name": "Concrete Worker", "disc": "Civil", "cert": "Safety"},
        {"name": "Rebar Fitter", "disc": "Civil", "cert": "Safety"},
        {"name": "Scaffolder", "disc": "Civil", "cert": "Heights"},
        {"name": "Crane Operator", "disc": "Mechanical", "cert": "Permit"},
        {"name": "I&C Technician", "disc": "I&C", "cert": "Instrumentation"},
        {"name": "Inspector (NDT)", "disc": "Safety", "cert": "ASNT Level II"}
    ]
    zone_codes = ["RB", "TH", "CT", "AB", "SY", "CR"]

    for i in range(250):
        skill = random.choice(skills)
        is_local = random.random() < 0.7
        shift_roll = random.random()
        shift = "day" if shift_roll < 0.5 else "night" if shift_roll < 0.85 else "off"
        days_worked = random.randint(0, 12)
        expires_in = random.randint(-30, 30) if random.random() < 0.1 else random.randint(31, 700)
        fatigue = min(100, max(0, (days_worked * 8) + (15 if shift == "night" else 0) + random.randint(-8, 8)))

        Worker.objects.create(
            employee_id=f"KZ-{10000 + i}",
            name=f"{random.choice(names_m)} {random.choice(names_l)}",
            skill=skill["name"],
            discipline=skill["disc"],
            zone_code=random.choice(zone_codes),
            available=(shift != "off" and random.random() < 0.8),
            shift=shift,
            days_worked=days_worked,
            fatigue=fatigue,
            origin="local" if is_local else "foreign",
            cert_name=skill["cert"],
            cert_status="expired" if expires_in < 0 else "expiring" if expires_in <= 30 else "valid",
            cert_expires_in_days=expires_in,
            years_experience=random.randint(1, 20)
        )


# --- API ЭНДПОИНТ ---
def api_hr_data(request):
    seed_database()  # Если таблица пустая, заполняем её!

    # 1. Достаем всё из базы
    zones = [{"id": z.code, "name": z.name, "discipline": z.discipline, "progress": z.progress, "status": z.status} for
             z in Zone.objects.all()]
    tasks = [{"id": t.task_id, "title": t.title, "skill": t.skill, "needed": t.needed, "zoneId": t.zone_code,
              "priority": t.priority, "deadlineDays": t.deadline_days} for t in Task.objects.all()]

    workers = []
    for w in Worker.objects.all():
        workers.append({
            "id": w.id, "employeeId": w.employee_id, "name": w.name, "skill": w.skill, "discipline": w.discipline,
            "zone": w.zone_code, "available": w.available, "shift": w.shift, "daysWorked": w.days_worked,
            "fatigue": w.fatigue, "origin": w.origin, "yearsExperience": w.years_experience,
            "cert": {"name": w.cert_name, "status": w.cert_status, "expiresInDays": w.cert_expires_in_days}
        })

    open_pos = [
        {"id": p.pos_id, "role": p.role, "needed": p.needed, "applicants": p.applicants, "daysOpen": p.days_open,
         "urgency": p.urgency, "source": p.source} for p in OpenPosition.objects.all()]
    hires = [{"name": h.name, "role": h.role, "startedDaysAgo": h.started_days_ago, "origin": h.origin,
              "onboardingPct": h.onboarding_pct} for h in RecentHire.objects.all()]
    trends = [{"month": t.month, "hired": t.hired, "attrited": t.attrited} for t in
              HiringTrend.objects.order_by('order')]

    return JsonResponse({
        "zones": zones,
        "tasks": tasks,
        "workers": workers,
        "openPositions": open_pos,
        "recentHires": hires,
        "hiringTrend": trends
    })