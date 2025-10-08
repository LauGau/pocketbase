/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2555859327")

  // add field
  collection.fields.addAt(4, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_3073759650",
    "hidden": false,
    "id": "relation2735237529",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "attcahment",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  // add field
  collection.fields.addAt(5, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_533777971",
    "hidden": false,
    "id": "relation2490651244",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "comment",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2555859327")

  // remove field
  collection.fields.removeById("relation2735237529")

  // remove field
  collection.fields.removeById("relation2490651244")

  return app.save(collection)
})
