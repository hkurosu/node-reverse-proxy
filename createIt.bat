openssl req -x509 -newkey rsa:2048 -keyout key.pem -out cert.pem -days 365 ^
  -subj "/C=US/ST=California/L=San Diego/O=BIOVIA/OU=R&D/CN=%1"
