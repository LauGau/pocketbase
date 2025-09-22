/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1778662752")

  // update collection data
  unmarshal({
    "listRule": "@request.auth.id != \"\" && @collection.collectionMembers.pinCollection ?= id && @collection.collectionMembers.user ?= @request.auth.id",
    "updateRule": "@request.auth.id != \"\" && @collection.collectionMembers.pinCollection ?= id && @collection.collectionMembers.user ?= @request.auth.id",
    "viewRule": "@request.auth.id != \"\" && @collection.collectionMembers.pinCollection ?= id && @collection.collectionMembers.user ?= @request.auth.id"
  }, collection)

  // remove field
  collection.fields.removeById("relation1168167679")

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1778662752")

  // update collection data
  unmarshal({
    "listRule": "@request.auth.id != \"\" &&\nmembers.id ?= @request.auth.id",
    "updateRule": "@request.auth.id != \"\" &&\n@request.auth.id ?= members.id",
    "viewRule": "@request.auth.id != \"\" &&\nmembers.id ?= @request.auth.id"
  }, collection)

  // add field
  collection.fields.addAt(4, new Field({
    "cascadeDelete": false,
    "collectionId": "_pb_users_auth_",
    "hidden": false,
    "id": "relation1168167679",
    "maxSelect": 999,
    "minSelect": 0,
    "name": "members",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
})
