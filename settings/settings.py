from pathlib import Path
from dotenv import load_dotenv
from datetime import timedelta
import os
load_dotenv()

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/4.2/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-ax5q&y*#=so_$#tpx7o2ar!97kz(b0qa)3t8t)s&0meri*!qyl'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
        "rest_framework.authentication.SessionAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.UserRateThrottle',
        'rest_framework.throttling.AnonRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'user': '1000/day',
        'anon': '10/minute',
    }
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(hours=6),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
}


AUTH_USER_MODEL = "api.CustomUser"

# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    "rest_framework",
    "api",
    "corsheaders",
    "channels",
    "sslserver",
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'corsheaders.middleware.CorsMiddleware',
]

ROOT_URLCONF = 'settings.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'settings.wsgi.application'

# Database
# https://docs.djangoproject.com/en/4.2/ref/settings/#databases

# Verificar se deve usar banco local ou na nuvem
USE_LOCAL_DB = os.getenv('USE_LOCAL_DB', 'False').lower() == 'true'

if USE_LOCAL_DB:
    # Configuração para PostgreSQL Local
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': os.getenv('LOCAL_DB_NAME', 'backstage'),
            'USER': os.getenv('LOCAL_DB_USER', 'postgres'),
            'PASSWORD': os.getenv('LOCAL_DB_PASSWORD', '123'),
            'HOST': os.getenv('LOCAL_DB_HOST', 'localhost'),
            'PORT': os.getenv('LOCAL_DB_PORT', '5432'),
            'OPTIONS': {
                'sslmode': 'disable'  # SSL não necessário para banco local
            }
        }
    }
    print(f"🔵 Usando PostgreSQL LOCAL: {os.getenv('LOCAL_DB_HOST')}:{os.getenv('LOCAL_DB_PORT')}/{os.getenv('LOCAL_DB_NAME')}")
else:
    # Configuração para PostgreSQL na Nuvem (Supabase)
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': os.getenv('DB_NAME', 'postgres'),
            'USER': os.getenv('DB_USER'),
            'PASSWORD': os.getenv('DB_PASSWORD'),
            'HOST': os.getenv('DB_HOST'),
            'PORT': os.getenv('DB_PORT', '6543'),
            'OPTIONS': {
                'sslmode': os.getenv('DB_SSLMODE', 'require')  # SSL obrigatório para Supabase
            }
        }
    }
    print(f"☁️  Usando PostgreSQL NA NUVEM (Supabase): {os.getenv('DB_HOST')}/{os.getenv('DB_NAME')}")



# Password validation
# https://docs.djangoproject.com/en/4.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/4.2/topics/i18n/

LANGUAGE_CODE = 'pt-BR'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/4.2/howto/static-files/

STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

# Default primary key field type
# https://docs.djangoproject.com/en/4.2/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True

CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://192.168.100.34:5173",
    "http://127.0.0.1:5173",
    "https://localhost:5173",
    "https://192.168.100.34:5173",
    "https://127.0.0.1:5173",
]

# Permitir todas as origens na rede local (desenvolvimento)
ALLOWED_HOSTS = ["https://incidents-product-prefers-lakes.trycloudflare.com/", "*"]

# Configurações de Segurança para HTTPS (Desenvolvimento)
# Em produção, ajuste conforme necessário
SECURE_SSL_REDIRECT = False  # Não redirecionar automaticamente para HTTPS em dev
SESSION_COOKIE_SECURE = False  # True em produção com HTTPS
CSRF_COOKIE_SECURE = False  # True em produção com HTTPS
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'SAMEORIGIN'

# Permitir WebSocket com WSS (WebSocket Secure)
CSRF_TRUSTED_ORIGINS = [
    "https://localhost:8000",
    "https://127.0.0.1:8000",
    "https://192.168.100.34:8000",
    "https://localhost:5173",
    "https://127.0.0.1:5173",
    "https://192.168.100.34:5173",
]

# Configuração adicional para CORS
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

# Permitir métodos HTTP necessários
CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]

# Channels Configuration
ASGI_APPLICATION = 'settings.asgi.application'

CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels.layers.InMemoryChannelLayer'
    }
}
