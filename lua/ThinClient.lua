local __VERSION__ = "0.0.0"

local http = require("socket.http")
local cjson = require("cjson")
local ltn12 = require("ltn12")

local assign = require("./assign")
local Object = require("./classic")

local ThinClient = Object:extend()

function ThinClient:clientSimpleMethods()
  return {}
end

function ThinClient:clientAgentString()
  return "ThinClient;ThinClient-lua/" .. __VERSION__
end

function ThinClient:new(url, context, opts)
  self._url = url or "http://localhost:8080"
  self._context = context or {agent = self:clientAgentString()}
  self._opts = assign({}, opts)

  -- Install simple methods
  -- TODO later
end

function ThinClient:clientDidReceiveData(data)
end

function ThinClient:clientDidReceiveCommands(commands)
end

function ThinClient:call(method, ...)
  local args = {...}

  local body =
    cjson.encode(
    {
      context = self._context,
      method = method,
      args = args
    }
  )

  local headers = {
    ["Content-Type"] = "application/json",
    ["Content-Length"] = #body
  }
  print("contentLength=", #body)

  local responseBody = {}
  local source = ltn12.source.string(body)
  print("source=", source)
  local sink = ltn12.sink.table(responseBody)

  local result, responseCode, responseHeaders, responseStatus =
    http.request {
    url = self._url,
    method = "POST",
    source = source,
    sink = sink
  }

  print(result)
  print(responseCode)
  print(responseStatus)

  if true then
    return body
  end

  -- TODO: Check error codes, etc.

  local responseText = table.concat(responseBody)

  local ok, response =
    pcall(
    function()
      return cjson.decode(responseText)
    end
  )
  if ok then
    return "json=" .. responseText
  else
    return "Error parsing json. json=" .. responseText
  end
end

return ThinClient
