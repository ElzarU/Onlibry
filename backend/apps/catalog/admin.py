from django.contrib import admin
from .models import Author, Genre, Book, Review

@admin.register(Author)
class AuthorAdmin(admin.ModelAdmin):
    list_display = ("id", "name")
    search_fields = ("name",)

@admin.register(Genre)
class GenreAdmin(admin.ModelAdmin):
    list_display = ("id", "name")
    search_fields = ("name",)

@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "year")
    search_fields = ("title", "description", "authors__name")
    list_filter = ("year", "genres")
    filter_horizontal = ("authors", "genres")

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ("id", "book", "user", "rating", "is_visible", "created_at")
    list_filter = ("rating", "is_visible", "created_at")
    search_fields = ("book__title", "user__username", "text")