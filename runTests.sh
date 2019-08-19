rm -r allure-results && \
mkdir allure-results && \
docker build . -t tests && \
docker run -ti --rm -v $PWD/allure-results:/app/allure-results --network container:api_tomcat_1 tests