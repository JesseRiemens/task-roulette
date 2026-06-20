export interface URLEncoder {
  encode(tasks: string[]): string
  decode(encoded: string): string[]
}

export class Base64Encoder implements URLEncoder {
  encode(tasks: string[]): string {
    const json = JSON.stringify(tasks)
    return btoa(encodeURIComponent(json))
  }

  decode(encoded: string): string[] {
    try {
      const json = decodeURIComponent(atob(encoded))
      const parsed = JSON.parse(json)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }
}

export class LZStringEncoder implements URLEncoder {
  encode(tasks: string[]): string {
    const json = JSON.stringify(tasks)
    return this.compressToEncodedURIComponent(json)
  }

  decode(encoded: string): string[] {
    try {
      const json = this.decompressFromEncodedURIComponent(encoded)
      if (!json) return []
      const parsed = JSON.parse(json)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }

  private compressToEncodedURIComponent(input: string): string {
    if (input == null) return ""
    return this._compress(input, 6, (a: number) => {
      return "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_".charAt(a)
    })
  }

  private decompressFromEncodedURIComponent(input: string): string | null {
    if (input == null) return ""
    if (input == "") return null
    input = input.replace(/ /g, "+")
    return this._decompress(input.length, 32, (index: number) => {
      return "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_".indexOf(input.charAt(index))
    })
  }

  private _compress(uncompressed: string, bitsPerChar: number, getCharFromInt: (a: number) => string): string {
    if (uncompressed == null) return ""
    let i, value
    const context_dictionary: { [key: string]: number } = {}
    const context_dictionaryToCreate: { [key: string]: boolean } = {}
    let context_c = ""
    let context_wc = ""
    let context_w = ""
    let context_enlargeIn = 2
    let context_dictSize = 3
    let context_numBits = 2
    const context_data: string[] = []
    let context_data_val = 0
    let context_data_position = 0

    for (let ii = 0; ii < uncompressed.length; ii += 1) {
      context_c = uncompressed.charAt(ii)
      if (!Object.prototype.hasOwnProperty.call(context_dictionary, context_c)) {
        context_dictionary[context_c] = context_dictSize++
        context_dictionaryToCreate[context_c] = true
      }

      context_wc = context_w + context_c
      if (Object.prototype.hasOwnProperty.call(context_dictionary, context_wc)) {
        context_w = context_wc
      } else {
        if (Object.prototype.hasOwnProperty.call(context_dictionaryToCreate, context_w)) {
          if (context_w.charCodeAt(0) < 256) {
            for (i = 0; i < context_numBits; i++) {
              context_data_val = context_data_val << 1
              if (context_data_position == bitsPerChar - 1) {
                context_data_position = 0
                context_data.push(getCharFromInt(context_data_val))
                context_data_val = 0
              } else {
                context_data_position++
              }
            }
            value = context_w.charCodeAt(0)
            for (i = 0; i < 8; i++) {
              context_data_val = (context_data_val << 1) | (value & 1)
              if (context_data_position == bitsPerChar - 1) {
                context_data_position = 0
                context_data.push(getCharFromInt(context_data_val))
                context_data_val = 0
              } else {
                context_data_position++
              }
              value = value >> 1
            }
          } else {
            value = 1
            for (i = 0; i < context_numBits; i++) {
              context_data_val = (context_data_val << 1) | value
              if (context_data_position == bitsPerChar - 1) {
                context_data_position = 0
                context_data.push(getCharFromInt(context_data_val))
                context_data_val = 0
              } else {
                context_data_position++
              }
              value = 0
            }
            value = context_w.charCodeAt(0)
            for (i = 0; i < 16; i++) {
              context_data_val = (context_data_val << 1) | (value & 1)
              if (context_data_position == bitsPerChar - 1) {
                context_data_position = 0
                context_data.push(getCharFromInt(context_data_val))
                context_data_val = 0
              } else {
                context_data_position++
              }
              value = value >> 1
            }
          }
          context_enlargeIn--
          if (context_enlargeIn == 0) {
            context_enlargeIn = Math.pow(2, context_numBits)
            context_numBits++
          }
          delete context_dictionaryToCreate[context_w]
        } else {
          value = context_dictionary[context_w]
          for (i = 0; i < context_numBits; i++) {
            context_data_val = (context_data_val << 1) | (value & 1)
            if (context_data_position == bitsPerChar - 1) {
              context_data_position = 0
              context_data.push(getCharFromInt(context_data_val))
              context_data_val = 0
            } else {
              context_data_position++
            }
            value = value >> 1
          }
        }
        context_enlargeIn--
        if (context_enlargeIn == 0) {
          context_enlargeIn = Math.pow(2, context_numBits)
          context_numBits++
        }
        context_dictionary[context_wc] = context_dictSize++
        context_w = String(context_c)
      }
    }

    if (context_w !== "") {
      if (Object.prototype.hasOwnProperty.call(context_dictionaryToCreate, context_w)) {
        if (context_w.charCodeAt(0) < 256) {
          for (i = 0; i < context_numBits; i++) {
            context_data_val = context_data_val << 1
            if (context_data_position == bitsPerChar - 1) {
              context_data_position = 0
              context_data.push(getCharFromInt(context_data_val))
              context_data_val = 0
            } else {
              context_data_position++
            }
          }
          value = context_w.charCodeAt(0)
          for (i = 0; i < 8; i++) {
            context_data_val = (context_data_val << 1) | (value & 1)
            if (context_data_position == bitsPerChar - 1) {
              context_data_position = 0
              context_data.push(getCharFromInt(context_data_val))
              context_data_val = 0
            } else {
              context_data_position++
            }
            value = value >> 1
          }
        } else {
          value = 1
          for (i = 0; i < context_numBits; i++) {
            context_data_val = (context_data_val << 1) | value
            if (context_data_position == bitsPerChar - 1) {
              context_data_position = 0
              context_data.push(getCharFromInt(context_data_val))
              context_data_val = 0
            } else {
              context_data_position++
            }
            value = 0
          }
          value = context_w.charCodeAt(0)
          for (i = 0; i < 16; i++) {
            context_data_val = (context_data_val << 1) | (value & 1)
            if (context_data_position == bitsPerChar - 1) {
              context_data_position = 0
              context_data.push(getCharFromInt(context_data_val))
              context_data_val = 0
            } else {
              context_data_position++
            }
            value = value >> 1
          }
        }
        context_enlargeIn--
        if (context_enlargeIn == 0) {
          context_enlargeIn = Math.pow(2, context_numBits)
          context_numBits++
        }
        delete context_dictionaryToCreate[context_w]
      } else {
        value = context_dictionary[context_w]
        for (i = 0; i < context_numBits; i++) {
          context_data_val = (context_data_val << 1) | (value & 1)
          if (context_data_position == bitsPerChar - 1) {
            context_data_position = 0
            context_data.push(getCharFromInt(context_data_val))
            context_data_val = 0
          } else {
            context_data_position++
          }
          value = value >> 1
        }
      }
      context_enlargeIn--
      if (context_enlargeIn == 0) {
        context_enlargeIn = Math.pow(2, context_numBits)
        context_numBits++
      }
    }

    value = 2
    for (i = 0; i < context_numBits; i++) {
      context_data_val = (context_data_val << 1) | (value & 1)
      if (context_data_position == bitsPerChar - 1) {
        context_data_position = 0
        context_data.push(getCharFromInt(context_data_val))
        context_data_val = 0
      } else {
        context_data_position++
      }
      value = value >> 1
    }

    while (true) {
      context_data_val = context_data_val << 1
      if (context_data_position == bitsPerChar - 1) {
        context_data.push(getCharFromInt(context_data_val))
        break
      } else context_data_position++
    }
    return context_data.join("")
  }

  private _decompress(length: number, resetValue: number, getNextValue: (index: number) => number): string {
    const dictionary: (string | number)[] = []
    let enlargeIn = 4
    let dictSize = 4
    let numBits = 3
    let entry: string | number = ""
    const result: string[] = []
    let w: string | number
    let bits, resb, maxpower, power
    let c: string | number
    const data = { val: getNextValue(0), position: resetValue, index: 1 }

    bits = 0
    maxpower = Math.pow(2, 2)
    power = 1
    while (power != maxpower) {
      resb = data.val & data.position
      data.position >>= 1
      if (data.position == 0) {
        data.position = resetValue
        data.val = getNextValue(data.index++)
      }
      bits |= (resb > 0 ? 1 : 0) * power
      power <<= 1
    }

    switch ((c = bits)) {
      case 0:
        bits = 0
        maxpower = Math.pow(2, 8)
        power = 1
        while (power != maxpower) {
          resb = data.val & data.position
          data.position >>= 1
          if (data.position == 0) {
            data.position = resetValue
            data.val = getNextValue(data.index++)
          }
          bits |= (resb > 0 ? 1 : 0) * power
          power <<= 1
        }
        c = String.fromCharCode(bits)
        break
      case 1:
        bits = 0
        maxpower = Math.pow(2, 16)
        power = 1
        while (power != maxpower) {
          resb = data.val & data.position
          data.position >>= 1
          if (data.position == 0) {
            data.position = resetValue
            data.val = getNextValue(data.index++)
          }
          bits |= (resb > 0 ? 1 : 0) * power
          power <<= 1
        }
        c = String.fromCharCode(bits)
        break
      case 2:
        return ""
    }
    dictionary[3] = c
    w = c
    result.push(c)
    while (true) {
      if (data.index > length) {
        return ""
      }

      bits = 0
      maxpower = Math.pow(2, numBits)
      power = 1
      while (power != maxpower) {
        resb = data.val & data.position
        data.position >>= 1
        if (data.position == 0) {
          data.position = resetValue
          data.val = getNextValue(data.index++)
        }
        bits |= (resb > 0 ? 1 : 0) * power
        power <<= 1
      }

      switch ((c = bits)) {
        case 0:
          bits = 0
          maxpower = Math.pow(2, 8)
          power = 1
          while (power != maxpower) {
            resb = data.val & data.position
            data.position >>= 1
            if (data.position == 0) {
              data.position = resetValue
              data.val = getNextValue(data.index++)
            }
            bits |= (resb > 0 ? 1 : 0) * power
            power <<= 1
          }

          dictionary[dictSize++] = String.fromCharCode(bits)
          c = dictSize - 1
          enlargeIn--
          break
        case 1:
          bits = 0
          maxpower = Math.pow(2, 16)
          power = 1
          while (power != maxpower) {
            resb = data.val & data.position
            data.position >>= 1
            if (data.position == 0) {
              data.position = resetValue
              data.val = getNextValue(data.index++)
            }
            bits |= (resb > 0 ? 1 : 0) * power
            power <<= 1
          }
          dictionary[dictSize++] = String.fromCharCode(bits)
          c = dictSize - 1
          enlargeIn--
          break
        case 2:
          return result.join("")
      }

      if (enlargeIn == 0) {
        enlargeIn = Math.pow(2, numBits)
        numBits++
      }

      if (dictionary[c as number]) {
        entry = dictionary[c as number]
      } else {
        if (c === dictSize) {
          const wStr = String(w)
          entry = wStr + wStr.charAt(0)
        } else {
          return ""
        }
      }
      const entryStr = String(entry)
      result.push(entryStr)

      const wStr = String(w)
      dictionary[dictSize++] = wStr + entryStr.charAt(0)
      enlargeIn--

      w = entry

      if (enlargeIn == 0) {
        enlargeIn = Math.pow(2, numBits)
        numBits++
      }
    }
  }
}

export const defaultEncoder: URLEncoder = new LZStringEncoder()
