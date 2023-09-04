
# Distance Vector Routing over XMPP

## Descripción

Este repositorio se centra en la implementación de algoritmos de enrutamiento para simular cómo los nodos en una red dinámica actualizan sus tablas de enrutamiento. Los algoritmos implementados incluyen Dijkstra, Flooding y Distance Vector Routing, entre otros. El proyecto sirve como una herramienta educativa para entender mejor cómo funcionan las tablas de enrutamiento y los algoritmos utilizados en las implementaciones actuales de Internet. Está especialmente diseñado para trabajar con el protocolo XMPP, permitiendo a los nodos enviar y recibir mensajes para conformar y actualizar sus tablas de enrutamiento.

## Objetivos

- Entender los algoritmos de enrutamiento utilizados en las implementaciones actuales de Internet.
- Comprender cómo funcionan las tablas de enrutamiento.
- Implementar y probar algoritmos de enrutamiento de forma "offline".

## Características y Uso

El proyecto permite la configuración inicial de nodos interconectados que conocen únicamente a sus vecinos directos. Los algoritmos de enrutamiento son implementados por los miembros del equipo y se pueden ejecutar en diversas plataformas.

## Requisitos

- Node.js
- npm

## Instalación

1. Clonar el repositorio

git clone https://github.com/Diego-CB/Lab3-Redes.git

2. Instalar dependencias

cd Lab3-Redes
npm install

## Uso

1. Ejecutar el programa

node <nombre del programa>.js

2. Seguir las instrucciones en la consola para configurar el nodo, establecer vecinos y realizar otras operaciones.

NOTA: En esta parte los nodos se deben introducir uno por uno definiendo los costos de enlaces y sus nombres.