/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2555859327")

  // update collection data
  unmarshal({
    "name": "events"
  }, collection)

  // add field
  collection.fields.addAt(1, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_1778662752",
    "hidden": false,
    "id": "relation1380179765",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "pinCollection",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  // add field
  collection.fields.addAt(3, new Field({
    "cascadeDelete": false,
    "collectionId": "_pb_users_auth_",
    "hidden": false,
    "id": "relation2375276105",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "user",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2555859327")

  // update collection data
  unmarshal({
    "name": "pinLogs"
  }, collection)

  // remove field
  collection.fields.removeById("relation1380179765")

  // remove field
  collection.fields.removeById("relation2375276105")

  return app.save(collection)
})
