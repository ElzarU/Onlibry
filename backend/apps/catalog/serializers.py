from rest_framework import serializers
from .models import Author, Genre, Book, Review, Favorite, UserBook


class AuthorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Author
        fields = ("id", "name")


class GenreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Genre
        fields = ("id", "name")


class BookSerializer(serializers.ModelSerializer):
    authors = AuthorSerializer(many=True, read_only=True)
    genres = GenreSerializer(many=True, read_only=True)
    avg_rating = serializers.FloatField(read_only=True)
    reviews_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Book
        fields = (
            "id",
            "title",
            "description",
            "year",
            "cover_url",
            "authors",
            "genres",
            "avg_rating",
            "reviews_count",
            "created_at",
        )


class BookCreateSerializer(serializers.ModelSerializer):
    author_ids = serializers.ListField(child=serializers.IntegerField(), required=False)
    genre_ids = serializers.ListField(child=serializers.IntegerField(), required=False)

    class Meta:
        model = Book
        fields = ("title", "description", "year", "cover_url", "author_ids", "genre_ids")


    def create(self, validated_data):
        author_ids = validated_data.pop("author_ids", [])
        genre_ids = validated_data.pop("genre_ids", [])
        book = Book.objects.create(**validated_data)
        if author_ids:
                book.authors.set(Author.objects.filter(id__in=author_ids))
        if genre_ids:
            book.genres.set(Genre.objects.filter(id__in=genre_ids))
        return book


class ReviewSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)  # 👈 ДОБАВИЛИ

    class Meta:
        model = Review
        fields = ("id", "book", "user", "rating", "text", "is_visible", "created_at")
        read_only_fields = ("user", "is_visible", "created_at")

    def validate_rating(self, v):
        if v < 1 or v > 5:
            raise serializers.ValidationError("Rating must be 1..5")
        return v

    def create(self, validated_data):
        validated_data["user"] = self.context["request"].user
        return super().create(validated_data)
        
class FavoriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Favorite
        fields = ("id", "book", "user", "created_at")
        read_only_fields = ("user", "created_at")

    def create(self, validated_data):
        validated_data["user"] = self.context["request"].user
        return super().create(validated_data)

class UserBookSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserBook
        fields = ("id", "book", "status", "created_at")
        read_only_fields = ("id", "created_at")

    def validate_status(self, value):
        allowed = {"TO_READ", "READING", "FINISHED"}
        if value not in allowed:
            raise serializers.ValidationError("Invalid status.")
        return value