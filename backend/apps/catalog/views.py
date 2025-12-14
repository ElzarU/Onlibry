from rest_framework import viewsets, mixins, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Avg, Count

from .models import Author, Genre, Book, Review, Favorite, UserBook
from .serializers import (
    AuthorSerializer, GenreSerializer,
    BookSerializer, BookCreateSerializer,
    ReviewSerializer, FavoriteSerializer,
    UserBookSerializer,
)
from .permissions import IsLibrarianOrReadOnly
from rest_framework.permissions import IsAuthenticated


class AuthorViewSet(viewsets.ModelViewSet):
    queryset = Author.objects.all().order_by("name")
    serializer_class = AuthorSerializer
    permission_classes = [IsLibrarianOrReadOnly]


class GenreViewSet(viewsets.ModelViewSet):
    queryset = Genre.objects.all().order_by("name")
    serializer_class = GenreSerializer
    permission_classes = [IsLibrarianOrReadOnly]


class BookViewSet(viewsets.ModelViewSet):
    queryset = (
        Book.objects
        .all()
        .annotate(
            avg_rating=Avg("reviews__rating"),
            reviews_count=Count("reviews")
        )
        .order_by("-id")
    )
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["genres", "authors", "year"]
    search_fields = ["title", "description", "authors__name"]
    ordering_fields = ["id", "year"]
    permission_classes = [IsLibrarianOrReadOnly]


    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return BookCreateSerializer
        return BookSerializer


class ReviewViewSet(mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet):
    queryset = Review.objects.select_related("book", "user").all().order_by("-id")
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


    def get_queryset(self):
        qs = super().get_queryset()
        book_id = self.request.query_params.get("book")
        if book_id:
            qs = qs.filter(book_id=book_id)
        return qs


class FavoriteViewSet(mixins.CreateModelMixin,
                      mixins.ListModelMixin,
                      mixins.DestroyModelMixin,
                      viewsets.GenericViewSet):
    serializer_class = FavoriteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # user can see only his own favorites
        return Favorite.objects.filter(user=self.request.user).select_related("book")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class UserBookViewSet(viewsets.ModelViewSet):
    """
    /api/user/books/
    - GET: список статусов текущего пользователя
    - POST: { book, status } -> создать/обновить
    - PATCH: обновить status
    - DELETE: удалить запись
    """
    serializer_class = UserBookSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return UserBook.objects.filter(user=self.request.user).select_related("book")

    def perform_create(self, serializer):
        # если запись уже есть — вместо ошибки обновим статус
        book = serializer.validated_data["book"]
        status = serializer.validated_data["status"]
        obj, _created = UserBook.objects.update_or_create(
            user=self.request.user,
            book=book,
            defaults={"status": status},
        )
        # хитрый трюк: вернуть созданный/обновлённый объект
        serializer.instance = obj