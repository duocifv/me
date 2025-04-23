name: Deploy to cPanel

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
    - name: Checkout repo
      uses: actions/checkout@v3

    - name: Install & build
      run: |
        npm ci
        npm run build

    - name: Copy files to cPanel via SCP
      uses: appleboy/scp-action@master
      with:
        host: ${{ secrets.CPANEL_HOST }}
        username: ${{ secrets.CPANEL_USER }}
        key: ${{ secrets.CPANEL_SSH_KEY }}
        port: ${{ secrets.CPANEL_PORT || 22 }}
        source: |
          dist/**
          src/typeorm.config.js
          package.json
          package-lock.json
        target: /home/${{ secrets.CPANEL_USER }}/app

    - name: Chạy migration & khởi động app
      uses: appleboy/ssh-action@master
      with:
        host: ${{ secrets.CPANEL_HOST }}
        username: ${{ secrets.CPANEL_USER }}
        key: ${{ secrets.CPANEL_SSH_KEY }}
        port: ${{ secrets.CPANEL_PORT || 22 }}
        script: |
          cd /home/${{ secrets.CPANEL_USER }}/app
          npm ci --only=production
          npm run migration:run -- -d src/typeorm.config.js
          pm2 restart my-app      # hoặc lệnh restart tương ứng trên cPanel
