from rest_framework.permissions import BasePermission, SAFE_METHODS

class IsLibrarianOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        #(GET, HEAD, OPTIONS) public access
        if request.method in SAFE_METHODS:
            return True

        user = request.user
        # only librarian/admin can modify
        return bool(
            user
            and user.is_authenticated
            and getattr(user, "is_librarian", lambda: False)()
        )