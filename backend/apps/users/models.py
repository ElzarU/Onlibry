from django.contrib.auth.models import AbstractUser
from django.db import models

class Roles(models.TextChoices):
    USER = "user", "User"
    LIBRARIAN = "librarian", "Librarian"
    ADMIN = "admin", "Admin"

class User(AbstractUser):
    role = models.CharField(max_length=20, choices=Roles.choices, default=Roles.USER)

    def is_librarian(self):
        return self.role in {Roles.LIBRARIAN, Roles.ADMIN}