/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1778662752")

  // update collection data
  unmarshal({
    "viewRule": "// is user logged in ?\n@request.auth.id != \"\" &&\n\n// is the user an approved member?\n(@collection.collectionMembers.pinCollection ?= id && @collection.collectionMembers.user ?= @request.auth.id && @collection.collectionMembers.status ?= \"approved\") &&\n\n// is the collection \"shared\" or \"private only\" ?\n(access_level != 'personal' || (collectionMembers_via_pinCollection.user ?~ @request.auth.id && (collectionMembers_via_pinCollection.role ?= \"owner\")))"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1778662752")

  // update collection data
  unmarshal({
    "viewRule": "// is user logged in ?\n@request.auth.id != \"\" &&\n\n// is the user an approved member?\n(@collection.collectionMembers.pinCollection ?= id && @collection.collectionMembers.user ?= @request.auth.id && @collection.collectionMembers.status ?= \"approved\") &&\n\n// is the collection \"shared\" or \"private only\" ?\n(access_level != 'personal' || owner.id = @request.auth.id)"
  }, collection)

  return app.save(collection)
})
