/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1778662752")

  // update collection data
  unmarshal({
    "listRule": "// everybody can see collections to allow search / join feature\nid != \"\"\n\n// is the collection \"shared\" or \"private only\" ?\n(access_level != 'personal' || (collectionMembers_via_pinCollection.user ?~ @request.auth.id && (collectionMembers_via_pinCollection.role ?= \"owner\")))"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1778662752")

  // update collection data
  unmarshal({
    "listRule": "// everybody can see collections to allow search / join feature\nid != \"\""
  }, collection)

  return app.save(collection)
})
