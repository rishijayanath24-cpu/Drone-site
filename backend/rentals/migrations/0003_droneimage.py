from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('rentals', '0002_review'),
    ]

    operations = [
        migrations.CreateModel(
            name='DroneImage',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('image_url', models.URLField(max_length=500)),
                ('caption', models.CharField(blank=True, default='', max_length=200)),
                ('order', models.PositiveSmallIntegerField(default=0)),
                ('drone', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='gallery',
                    to='rentals.drone',
                )),
            ],
            options={'ordering': ['order']},
        ),
    ]
