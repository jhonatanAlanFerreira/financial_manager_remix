#!/bin/bash

wait_for_mongo() {
    local host="$1"
    echo "Waiting for MongoDB at $host to be ready..."
    while true; do
        if mongosh --host "$host" --eval "db.adminCommand('ping')" &>/dev/null; then
            echo "MongoDB at $host is ready!"
            break
        else
            echo "MongoDB at $host not ready, retrying in 2 seconds..."
            sleep 2
        fi
    done
}

wait_for_mongo host.docker.internal:$MONGO_FINANCIAL_MANAGER_PORT

mongosh --host host.docker.internal:$MONGO_FINANCIAL_MANAGER_PORT --eval "
rs.initiate({
    _id: 'financialDbReplicaSet',
    members: [
        {_id: 0, host: 'host.docker.internal:$MONGO_FINANCIAL_MANAGER_PORT'},
        {_id: 1, host: 'host.docker.internal:$MONGO_FINANCIAL_MANAGER_REPLICA_1_PORT'},
        {_id: 2, host: 'host.docker.internal:$MONGO_FINANCIAL_MANAGER_REPLICA_2_PORT'}
    ]
})
"