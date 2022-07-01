const lz = require('./LZString')

/**
 * This script implements compression and decompression the data using the LZ-String algorithm with the alphabet gathered from the ray script.
 * The compressed data is what the Ray Script sends to the cloudflare server.
 */
let alphabet = 'Dki68XNJstrwL+pgMF1d25QZefTuzVWbaCx-47IBohOmEy9UqcK$lvHjSRAP0n3GY' // LZ encode URI alphabet (65 chars string)
let input = '{"chReq":"managed","cNounce":"24624","cvId":"2","chC":0,"chCAS":0,"oV":1,"cRq":{"ru":"aHR0cHM6Ly93d3cuaW5udmljdHVzLmNvbS9jYWJhbGxlcm9zL2Jhc2tldC9hY2Nlc29yaW9zL21pdGNoZWxsLWFuZC1uZXNzL2dvcnJhLW1pdGNoZWxsLWFuZC1uZXNzLWJ1bGxzLWluLWEtZ2FsYXh5LXRpZS1keWUvcC8wMDAwMDAwMDAwMDAyNTE0MzI=","ra":"TW96aWxsYS81LjAgKFdpbmRvd3MgTlQgMTAuMDsgV2luNjQ7IHg2NCkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzEwMy4wLjUwNjAuNTMgU2FmYXJpLzUzNy4zNg==","rm":"R0VU","d":"P7VF/v2cQ/iWO2Lu2TgLQuoSds47eYPynvvMeX6ToUrYsNzXag+YXKjlHOWMRfxebPbdclNaz1D2a5K0NX+zSPNqL/E79Fp16v3JgGzCvgjCR029aRXxsKWdW8cCIdivMQTJ7GOvwXJ6byKx1kUg5Chwd7RTfUydpKmadh34ZlnKc320th7KmHImUGAzXJ2BqM6RDqWsINa4/qp92eXkOcxrMESk7bS1JnscXTNpjd2owHuoLoWsFoji3U2L1bI76v3JPBA7ss4t5wfTgX1ki1Kq3BODDpmkFOsIkHq4pOi4ygpeYxlqlfIZlo3jGel0+v0wcdzIzHb1840hv24QhW+M51xAm2ihQlsgSckPjXjM1OCaF1bVE6/SGEztXvJ/yNf3mv0kEJR3KApBgp7fTdQGiD9YoIPhmCK6Ivx4Cz/qO7e/rz2K2fvp9LwYRwTuAwTwSS7Ctnn9/EvxN4bAHgMkzGvX3XaA54oGuAMwYdgYJYC/CiQsc0oTrQBQINkBnFopV6H3hRL409VfTIygOu2qb8140Q1DveAdZuoUzsK+q4pjTPvdGkYMDIofCrmxoPsXgM9bxNnHN0+UZPHf5PTfxlltIqqJ+u5qaUz2dPa46pf3A1PYS2RMLHNj9JZQ","t":"MTY1NjUzNjEwMy45NTUwMDA=","m":"SAk9Fiaphq5pOH5UiK6UnAvObICXB4C0MZkObRVuYWA=","i1":"PSX/40JBCtCOiWrWTf1LqA==","i2":"DHymH3eNEuE2UcYo8JM9Zg==","zh":"AkyjE5lcJ32T5gwLUqUs7Kx36QI9b8wZUioOnG4YAE0=","uh":"oR/mG2Rn/6dj1Xt1sHADBr05pczmJajMjEpX2EVa/p0=","hh":"8D1voajk9osLg0UNEd+bMBJgmTBsmaaBjozZ3bEuf8U="},"ie":0,"ffs":false}' // Request payload value of /generate/ov1/

input = input.replace(/ /g, '+')


// encript & compress
const output = lz._compress(input, 6, function (index) {
	// console.log(index)
    return alphabet.charAt(index)

})
console.log(output)



// for testing purposes
// decript & decompress
const baseReverseDic = {}
function getBaseValue(alphabet, character) {
	if (!baseReverseDic[alphabet]) {
		baseReverseDic[alphabet] = {}
		for (let i = 0; i < alphabet.length; i++) {
			baseReverseDic[alphabet][alphabet.charAt(i)] = i
		}
	}
	return baseReverseDic[alphabet][character]
}
const reversed = lz._decompress(output.length, 32, function (index) {
	return getBaseValue(alphabet, output.charAt(index))
})
console.log('----------------')
console.log(reversed)
// lz.compressToEncodedURIComponent()