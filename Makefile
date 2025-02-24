default: dev

build:
	@echo "Building production bundle..."
	@npm run build

dev:
	@echo "Starting dev web server..."
	@npm run dev

build-preview:
	@echo "Building production bundle and starting production web server..."
	@npm run build && npm run preview

install:
	@echo "Installing npm modules..."
	@npm ci
