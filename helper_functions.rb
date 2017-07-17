require 'erb'
require 'date'
require 'rest-client'
require 'json'

# for swapping in events if it wasn't caught by JS client-side
$message_symbols = {
  ':music:' => '♫',
  ':rocket:' => '🚀',
  ':sat:' => '🛰',
  ':satellite:' => '🛰'
}

def _session
  $sess_var[session[:id]]
end

# take a file name, return rendered HTML from .erb file
def render_erb(fname)
  file = File.read("#{fname}.erb")
  ERB.new(file).result(binding)
end

# fully formatted markdown post
def reddit_post
  if _session[:events]
    "#{_session[:intro]}\n\n#{_session[:viewing]}\n\n### Live Updates\n
    #{format_events _session[:events]}\n\n#{_session[:stats]}\n
    #{_session[:mission]}\n\n#{_session[:landing]}\n\n#{_session[:resources]}\n
    #{_session[:participate]}"
  else
    "#{_session[:intro]}\n\n#{_session[:viewing]}\n\n#{_session[:stats]}\n
    #{_session[:mission]}\n\n#{_session[:landing]}\n\n#{_session[:resources]}\n
    #{_session[:participate]}"
  end
end

# get score, number of comments, and html from reddit post id
def post_info(id)
  submission = request.env['redd.session'].from_ids ["t3_#{id}"].to_ary
  {
    'score' => submission[0].score,
    'num_comments' => submission[0].num_comments,
    'html' => submission[0].selftext_html
  }
end

# create a self post with a given title and text
# specified subreddit can be swapped out easily
def make_post(title, text = '')
  request
    .env['redd.session']
    .subreddit('spacextesting')
    .submit title, text: text, sendreplies: false
end

# creates a post if it doesn't exist
# edits post if it exists
def update_post
  if _session[:post].nil?
    title = "r/SpaceX #{_session[:launch]} Official Launch Discussion & " \
            'Updates Thread'
    post = make_post title, reddit_post
    _session[:post] = post.id
  else
    post = request.env['redd.session'].from_ids ["t3_#{_session[:post]}"]
    post[0].edit reddit_post
  end
  post_info(_session[:post])['html']
end

# get list of events and return a formatted table
def format_events(events)
  return if events.nil?
  str = "| Time | Update |\n| --- | --- |"
  events.each do |event|
    event = event[1]
    if event[1] == '' then next end # only display events with message

    # substitute where possible
    $message_symbols.each { |k, v| event[1][k] &&= v }
    str += "\n| #{event[0]} | #{event[1]} |"
  end
  str
end

# get all launches within 7 days
def upcoming_launches
  d = Date.today
  today = d.to_s
  one_week = (d + 7).to_s

  params = { params: { start: today, final: one_week } }
  resp = RestClient.get 'https://api.spacexdata.com/launches/upcoming', params
  body = JSON.parse(resp.body)
  return body if body.is_a? Hash # error (success is array)

  launches = {}
  body.each do |obj|
    date = DateTime.parse(obj['launch_date_utc']).strftime('%s')

    if obj['payload_1'].start_with? 'SpaceX ' # CRS missions
      obj['payload_1'] = obj['payload_1'][7..-1]
    end
    launches[obj['payload_1']] = date
  end
  launches
end
