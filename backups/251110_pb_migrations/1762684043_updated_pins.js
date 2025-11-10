/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_402820656")

  // update collection data
  unmarshal({
    "updateRule": "// is user logged in ?\n@request.auth.id != \"\"\n\n// is the user an approved member?\n && (pinCollection.collectionMembers_via_pinCollection.user ?~ @request.auth.id && pinCollection.collectionMembers_via_pinCollection.status ?= \"approved\")\n\n// UPDATE: even the \"members\" should have the right to update a pin to be able to modify its \"isResolved\" status... (and mark them as done)"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_402820656")

  // update collection data
  unmarshal({
    "updateRule": "// is user logged in ?\n@request.auth.id != \"\" &&\n\n// is the user an approved member?\n(pinCollection.collectionMembers_via_pinCollection.user ?~ @request.auth.id && pinCollection.collectionMembers_via_pinCollection.status ?= \"approved\") &&\n\n// is user has the rights to update...\n(creator = @request.auth.id || (pinCollection.collectionMembers_via_pinCollection.user ?~ @request.auth.id && (pinCollection.collectionMembers_via_pinCollection.role ?= \"owner\" || pinCollection.collectionMembers_via_pinCollection.role ?= \"admin\")))"
  }, collection)

  return app.save(collection)
})
