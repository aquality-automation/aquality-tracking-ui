rmdir allure-results /s
mkdir allure-results
docker build . -t tests
docker run -ti --rm -v %cd%\allure-results:/app/allure-results --network container:api_tomcat_1 tests