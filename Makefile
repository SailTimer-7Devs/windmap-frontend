default: dev

install:
	@echo "Installing npm modules..."
	@npm ci

dev:
	@echo "Starting dev web server..."
	@npm run dev

build:
	@echo "Building production bundle..."
	@npm run build

build-preview:
	@echo "Building production bundle and starting production web server..."
	@npm run build && npm run preview
