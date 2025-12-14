from django.db import models
from django.conf import settings


class Author(models.Model):
    name = models.CharField(max_length=255, unique=True)
    def __str__(self): return self.name


class Genre(models.Model):
    name = models.CharField(max_length=255, unique=True)
    def __str__(self): return self.name


class Book(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    year = models.IntegerField(null=True, blank=True)
    cover_url = models.URLField(blank=True, null=True)
    authors = models.ManyToManyField(Author, related_name="books", blank=True)
    genres = models.ManyToManyField(Genre, related_name="books", blank=True)
    created_at = models.DateTimeField(auto_now_add=True)


class Meta:
    indexes = [models.Index(fields=["title"])]
    unique_together = [] 


class Review(models.Model):
    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name="reviews")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    rating = models.IntegerField()
    text = models.TextField(blank=True)
    is_visible = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)


    class Meta:
        unique_together = ("book", "user") # one review per (user, book)
        indexes = [models.Index(fields=["book"])][0:]
    
class Favorite(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="favorites"
    )
    book = models.ForeignKey(
        Book,
        on_delete=models.CASCADE,
        related_name="favorited_by"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "book")
        indexes = [
            models.Index(fields=["user", "book"]),
        ]

    def __str__(self):
        return f"{self.user.username} → {self.book.title}"

class UserBookStatus(models.TextChoices):
    TO_READ = "TO_READ", "To Read"
    READING = "READING", "Reading"
    FINISHED = "FINISHED", "Finished"


class UserBook(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="user_books"
    )
    book = models.ForeignKey(
        Book,
        on_delete=models.CASCADE,
        related_name="user_books"
    )
    status = models.CharField(max_length=20, choices=UserBookStatus.choices)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "book")
        indexes = [
            models.Index(fields=["user", "status"]),
        ]

    def __str__(self):
        return f"{self.user} - {self.book} ({self.status})"