#!/bin/bash
# init-replica-set.sh

hosts=("mongo_financial_manager" "mongo_financial_manager_replica_1" "mongo_financial_manager_replica_2")

# Initiate the replica set
mongosh --host ${hosts[0]} --eval "
rs.initiate({
    _id: 'financialDbReplicaSet',
    members: [
        {_id: 0, host: '${hosts[0]}'},
        {_id: 1, host: '${hosts[1]}'},
        {_id: 2, host: '${hosts[2]}'}
    ]
})
"
