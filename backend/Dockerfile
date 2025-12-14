FROM python:3.11-slim
WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1 \ 
	PYTHONUNBUFFERED=1
COPY pyproject.toml /app/
RUN pip install --upgrade pip && pip install -U pip setuptools wheel \
  && pip install -r <(python - <<'PY'
import tomllib
with open('pyproject.toml','rb') as f:
  t=tomllib.load(F)
print('\n'.join(t['project']['dependencies']))
PY
)
COPY backend /app/
EXPOSE 8000