from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name='Drone',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('model', models.CharField(max_length=100)),
                ('image_url', models.URLField(blank=True, default='', max_length=500)),
                ('price_per_hour', models.DecimalField(decimal_places=2, max_digits=8)),
                ('description', models.TextField(blank=True, default='')),
                ('is_available', models.BooleanField(default=True)),
            ],
        ),
        migrations.CreateModel(
            name='Rental',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=150)),
                ('email', models.EmailField(max_length=254)),
                ('start_time', models.DateTimeField()),
                ('end_time', models.DateTimeField(blank=True, null=True)),
                ('total_cost', models.DecimalField(decimal_places=2, default=0, max_digits=10)),
                ('returned', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('drone', models.ForeignKey(
                    on_delete=django.db.models.deletion.PROTECT,
                    related_name='rentals',
                    to='rentals.drone',
                )),
            ],
        ),
    ]
