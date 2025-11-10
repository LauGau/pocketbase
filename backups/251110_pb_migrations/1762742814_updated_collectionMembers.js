/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_482864135")

  // update collection data
  unmarshal({
    "deleteRule": "// Primarly used when a user is \"excluded\" from a collection\n// Last tested tested: 2025-11-10\n// Status: ✅\n\n// is user logged in ?\n@request.auth.id != \"\"\n\n// is the user an approved member on the pinCollection?\n&& (pinCollection.collectionMembers_via_pinCollection.user ?~ @request.auth.id && pinCollection.collectionMembers_via_pinCollection.status ?= \"approved\")\n\n// is user has the rights to delete (\"owner\" only)\n// && (user.id = @request.auth.id && role = \"owner\")\n&& (pinCollection.collectionMembers_via_pinCollection.user ?~ @request.auth.id && (pinCollection.collectionMembers_via_pinCollection.role ?= \"owner\") || (pinCollection.collectionMembers_via_pinCollection.role ?= \"admin\"))"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_482864135")

  // update collection data
  unmarshal({
    "deleteRule": "// is user logged in ?\n@request.auth.id != \"\"\n\n// is the user an approved member on the pinCollection?\n&& (pinCollection.collectionMembers_via_pinCollection.user ?~ @request.auth.id && pinCollection.collectionMembers_via_pinCollection.status ?= \"approved\")\n\n// is user has the rights to delete (\"owner\" only)\n// && (user.id = @request.auth.id && role = \"owner\")\n&& (pinCollection.collectionMembers_via_pinCollection.user ?~ @request.auth.id && (pinCollection.collectionMembers_via_pinCollection.role ?= \"owner\") || (pinCollection.collectionMembers_via_pinCollection.role ?= \"admin\"))"
  }, collection)

  return app.save(collection)
})
