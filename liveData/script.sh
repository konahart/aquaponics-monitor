#!/bin/bash

i=4
while ( $true )
do
    echo $i >> data.txt
    i=$((i + 1))
    sleep 1
done
