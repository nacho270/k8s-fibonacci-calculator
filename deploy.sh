docker build -t nacho270/docker-fibonacci-calculator-client:latest -t nacho270/docker-fibonacci-calculator-client:$SHA -f ./client/Dockerfile ./client
docker build -t nacho270/docker-fibonacci-calculator-server:latest -t nacho270/docker-fibonacci-calculator-server:$SHA -f ./server/Dockerfile ./server
docker build -t nacho270/docker-fibonacci-calculator-worker:latest -t nacho270/docker-fibonacci-calculator-worker:$SHA -f ./worker/Dockerfile ./worker

docker push nacho270/docker-fibonacci-calculator-client:latest
docker push nacho270/docker-fibonacci-calculator-server:latest
docker push nacho270/docker-fibonacci-calculator-worker:latest

docker push nacho270/docker-fibonacci-calculator-client:$SHA
docker push nacho270/docker-fibonacci-calculator-server:$SHA
docker push nacho270/docker-fibonacci-calculator-worker:$SHA

kubectl apply -f k8s

kubectl set image deployments/client-deployment client=nacho270/docker-fibonacci-calculator-client:$SHA
kubectl set image deployments/server-deployment server=nacho270/docker-fibonacci-calculator-server:$SHA
kubectl set image deployments/worker-deployment worker=nacho270/docker-fibonacci-calculator-worker:$SHA