from django.db import models


class Employee(models.Model):
    ROLE_CHOICES = [
        ('engineer', 'Инженер'),
        ('builder', 'Строитель'),
        ('manager', 'Менеджер'),
    ]
    first_name = models.CharField(max_length=100, verbose_name="Имя")
    last_name = models.CharField(max_length=100, verbose_name="Фамилия")
    role = models.CharField(max_length=50, choices=ROLE_CHOICES, verbose_name="Должность")
    is_local = models.BooleanField(default=True, verbose_name="Местный специалист")
    shift_start = models.DateField(verbose_name="Начало вахты/смены")

    def __str__(self):
        return f"{self.first_name} {self.last_name} - {self.get_role_display()}"