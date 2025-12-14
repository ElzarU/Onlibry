from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AuthorViewSet, GenreViewSet, BookViewSet, ReviewViewSet, FavoriteViewSet, UserBookViewSet

router = DefaultRouter()
router.register(r"authors", AuthorViewSet)
router.register(r"genres", GenreViewSet)
router.register(r"reviews", ReviewViewSet, basename="reviews")
router.register(r"favorites", FavoriteViewSet, basename="favorites")
router.register(r"user/books", UserBookViewSet, basename="user-books")
router.register(r"books", BookViewSet, basename="book")

urlpatterns = [
    path("", include(router.urls)),
]