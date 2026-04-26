from django.db import models

class Supply(models.Model):
    STATUS_CHOICES = [
        ('ordered', 'Заказано'),
        ('in_transit', 'В пути'),
        ('delivered', 'Доставлено'),
    ]
    item_name = models.CharField(max_length=200, verbose_name="Наименование груза")
    quantity = models.IntegerField(verbose_name="Количество")
    origin = models.CharField(max_length=200, verbose_name="Пункт отправления")
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='ordered')
    expected_arrival = models.DateField(verbose_name="Ожидаемая дата прибытия")

    def __str__(self):
        return self.item_name